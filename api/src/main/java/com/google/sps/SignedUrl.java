package com.google.sps;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RequestMethod;

import com.google.auth.Credentials;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.HttpMethod;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import java.io.FileInputStream;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@RestController
public class SignedUrl {
  private static final String projectId = "phoebeliang-step";

  @PostMapping("/api/signUpload")
  String signUpload(@RequestBody String url) throws Exception {
    return generateV4GPutObjectSignedUrl(url);
  }

  @PostMapping("/api/signDownload")
  String signDownload(@RequestBody String url) throws Exception {
    return generateV4GetObjectSignedUrl(url);
  }

  private static Storage initStorage() throws Exception {
    Credentials credentials = GoogleCredentials
      .fromStream(new FileInputStream("./config.json"));
    return StorageOptions.newBuilder().setCredentials(credentials)
      .setProjectId(projectId).build().getService();
  }

  private static BlobInfo defineResource(String bucketName, String objectName) {
    return BlobInfo.newBuilder(BlobId.of(bucketName, objectName)).build();
  }

  // Taken from https://cloud.google.com/storage/docs/access-control/signing-urls-with-helpers
  public static String generateV4GPutObjectSignedUrl(String objectName) throws Exception {
    Storage storage = initStorage();
    BlobInfo blobInfo = defineResource("pictophone-images", objectName);
    String mimeType = MimetypesFileTypeMap.getDefaultFileTypeMap().getContentType(objectName);

    Map<String, String> extensionHeaders = new HashMap<>();
    extensionHeaders.put("Content-Type", mimeType);

    URL url =
      storage.signUrl(
        blobInfo,
        15,
        TimeUnit.MINUTES,
        Storage.SignUrlOption.httpMethod(HttpMethod.PUT),
        Storage.SignUrlOption.withExtHeaders(extensionHeaders),
        Storage.SignUrlOption.withV4Signature());

    return url.toString();
  }

  public static String generateV4GetObjectSignedUrl(String objectName) throws Exception {
    Storage storage = initStorage();
    BlobInfo blobInfo = defineResource("pictophone-drawings", objectName);

    URL url =
        storage.signUrl(blobInfo, 15, TimeUnit.MINUTES,
        Storage.SignUrlOption.withV4Signature());

    return url.toString();
  }
}
