package com.google.sps;

import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import com.google.auth.Credentials;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;

public class ImageStorage {
  final static String projectId = "phoebeliang-step";
  final static String bucketName = "pictophone-images";

  public static Storage initStorage() throws Exception {
    Credentials credentials = GoogleCredentials.fromStream(new FileInputStream("./config.json"));
    System.out.println("Credentials stored...");
    return StorageOptions.newBuilder().setCredentials(credentials).setProjectId(projectId).build().getService();
  }

  public static void uploadObject(String objectName, String filePath) throws IOException {
    try{
      Storage storage = initStorage();
      BlobId blobId = BlobId.of(bucketName, objectName);
      BlobInfo blobInfo = BlobInfo.newBuilder(blobId).build();
      storage.create(blobInfo, Files.readAllBytes(Paths.get(filePath)));
    } catch(Exception e) {
      System.out.println(e);
    }
  }

  public static void downloadObject(String objectName, Path destFilePath) {
    try {
      Storage storage = initStorage();

      Blob blob = storage.get(BlobId.of(bucketName, objectName));
      System.out.println("Blob retrieved..");
      blob.downloadTo(destFilePath);
      System.out.println("image downloaded...");
    } catch(Exception e) {
      System.out.println(e);
    }
  }

  public static void deleteObject(String objectName) {
    try {
      Storage storage = initStorage();
      storage.delete(bucketName, objectName);
    } catch (Exception e) {
      System.out.println(e);
    }
  }
}
