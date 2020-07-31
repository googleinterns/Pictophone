// Modified from https://cloud.google.com/blog/products/storage-data-transfer/uploading-images-directly-to-cloud-storage-by-using-signed-url
package function

import (
        "context"
        "errors"
        "fmt"
        "image"
        "image/gif"
        "image/jpeg"
        "image/png"
        "log"

				firebase "firebase.google.com/go"
				"cloud.google.com/go/firestore"
        "cloud.google.com/go/storage"
        vision "cloud.google.com/go/vision/apiv1"
        "golang.org/x/xerrors"
        pb "google.golang.org/genproto/googleapis/cloud/vision/v1"
)

type GCSEvent struct {
        Bucket string `json:"bucket"`
        Name   string `json:"name"`
}

var retryableError = xerrors.New("upload: retryable error")

func validate(ctx context.Context, obj *storage.ObjectHandle) error {
        attrs, err := obj.Attrs(ctx)
        if err != nil {
                return xerrors.Errorf("upload: failed to get object attributes %q : %w",
                        obj.ObjectName(), retryableError)
        }
        // Maximum upload size of 5MB
        if attrs.Size >= 1024*1024*5 {
                return fmt.Errorf("upload: image file is too large, got = %d", attrs.Size)
        }
        // Validates obj and returns true if it conforms supported image formats.
        if err := validateMIMEType(ctx, attrs, obj); err != nil {
                return err
        }
        // Validates obj by calling Vision API.
        return validateByVisionAPI(ctx, obj)
}

func validateMIMEType(ctx context.Context, attrs *storage.ObjectAttrs, obj *storage.ObjectHandle) error {
        r, err := obj.NewReader(ctx)
        if err != nil {
                return xerrors.Errorf("upload: failed to open new file %q : %w",
                        obj.ObjectName(), retryableError)
        }
        defer r.Close()
        if _, err := func(ct string) (image.Image, error) {
                switch ct {
                case "image/png":
                        return png.Decode(r)
                case "image/jpeg", "image/jpg":
                        return jpeg.Decode(r)
                case "image/gif":
                        return gif.Decode(r)
                default:
                        return nil, fmt.Errorf("upload: unsupported MIME type, got = %q", ct)
                }
        }(attrs.ContentType); err != nil {
                return err
        }
        return nil
}

// validateByVisionAPI uses Safe Search Detection provided by Cloud Vision API.
// See more details: https://cloud.google.com/vision/docs/detecting-safe-search
func validateByVisionAPI(ctx context.Context, obj *storage.ObjectHandle) error {
        client, err := vision.NewImageAnnotatorClient(ctx)
        if err != nil {
                return xerrors.Errorf(
                        "upload: failed to create a ImageAnnotator client, error = %v : %w",
                        err,
                        retryableError,
                )
        }
        ssa, err := client.DetectSafeSearch(
                ctx,
                vision.NewImageFromURI(fmt.Sprintf("gs://%s/%s", obj.BucketName(), obj.ObjectName())),
                nil,
        )
        if err != nil {
                return xerrors.Errorf(
                        "upload: failed to detect safe search, error = %v : %w",
                        err,
                        retryableError,
                )
        }
        // Returns an unretryable error if there is any possibility of inappropriate image.
        // Likelihood has been defined in the following:
        // https://github.com/google/go-genproto/blob/5fe7a883aa19554f42890211544aa549836af7b7/googleapis/cloud/vision/v1/image_annotator.pb.go#L37-L50
        if ssa.Adult >= pb.Likelihood_POSSIBLE ||
                ssa.Medical >= pb.Likelihood_POSSIBLE ||
                ssa.Violence >= pb.Likelihood_POSSIBLE ||
                ssa.Racy >= pb.Likelihood_POSSIBLE {
                return errors.New("upload: exceeds the prescribed likelihood")
        }
        return nil
}

const projectID = "phoebeliang-step"

func initFirestore(ctx context.Context) (*firestore.Client, error) {
        conf := &firebase.Config{ProjectID: projectID}
        app, err := firebase.NewApp(ctx, conf)
        if err != nil {
                return nil, err
        }
        return app.Firestore(ctx)
}

// Update Firestore collection with status message
func statusUpdate(ctx context.Context, client *firestore.Client, status string, ok bool, doc string) {
        _, err := client.Collection("upload-progress").Doc(doc).Set(ctx, map[string]interface{}{
                "status":  status,
                "ok":      ok,
        })
        if err != nil {
                log.Printf("An error has occurred: %s", err)
        }
}

// distributionBucket is the distribution bucket.
// It's used for distributing all of passed files.
// This value MUST be updated before deploying this function.
const distributionBucket = "pictophone-drawings"

// UploadImage validates the object and copy it into the distribution bucket.
func UploadImage(ctx context.Context, e GCSEvent) error {

        // Initialize Cloud Storage bucket and Firestore
        client, err := storage.NewClient(ctx)
        if err != nil {
                return fmt.Errorf("upload: failed to construct a Storage client, error = %v", err)
        }
        defer client.Close()

        clientF, err := initFirestore(ctx)
        if err != nil {
                return fmt.Errorf("upload: failed to construct a Firestore client, error = %v", err)
        }
        defer clientF.Close()

        dst := client.Bucket(distributionBucket).Object(e.Name)
        _, err = dst.Attrs(ctx)
        // Avoid proceeding if the object has been copied to destination.
        if err == nil {
                statusUpdate(ctx, clientF, "upload already exists in destination bucket", false, e.Name)
                log.Printf("upload: %s has already been copied to destination\n", e.Name)
                return nil
        }
        // Return retryable error as there is a possibility that object does not temporarily exist.
        if err != storage.ErrObjectNotExist {
                statusUpdate(ctx, clientF, "storage object doesn't exist, please try again!", false, e.Name)
                return err
        }
        src := client.Bucket(e.Bucket).Object(e.Name)
        if err := validate(ctx, src); err != nil {
                statusUpdate(ctx, clientF, fmt.Sprintf("%v", err), false, e.Name)
                if xerrors.Is(err, retryableError) {
                        return err
                }
                log.Println(err)
                return nil
        }
        // Returns an error if the copy operation failed.
        // Will retry the same processing later.
        if _, err := dst.CopierFrom(src).Run(ctx); err != nil {
                statusUpdate(ctx, clientF, "upload already exists in destination bucket", false, e.Name)
                return err
        }

        statusUpdate(ctx, clientF, "ok", true, e.Name)
        return nil
}
