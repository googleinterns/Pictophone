package com.google.sps;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

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
public class SignedUpload {
  static WebClient webClient = WebClient.create();

  @PostMapping("/api/signUrl")
  String sign(@RequestBody String url) throws Exception {
    return generateV4GPutObjectSignedUrl(url);
  }

  // Taken from https://cloud.google.com/storage/docs/access-control/signing-urls-with-helpers
  public static String generateV4GPutObjectSignedUrl(String objectName) throws Exception {
    String projectId = "phoebeliang-step";
    String bucketName = "pictophone-drawings";

    Credentials credentials = GoogleCredentials
      .fromStream(new FileInputStream("./config.json"));
    Storage storage = StorageOptions.newBuilder().setCredentials(credentials)
      .setProjectId(projectId).build().getService();

    // Define Resource
    BlobInfo blobInfo = BlobInfo.newBuilder(BlobId.of(bucketName, objectName)).build();

    // Generate Signed URL
    Map<String, String> extensionHeaders = new HashMap<>();
    extensionHeaders.put("Content-Type", "image/png");

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
}
