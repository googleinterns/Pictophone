package com.google.sps;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.Query;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;
import com.google.api.core.ApiFuture;

import java.io.IOException;
import java.util.List;

import org.springframework.web.bind.annotation.RestController;

@RestController
public class ValidateUsername {
  @PostMapping("/validateUsername")
  String checkUsername(@RequestBody String username) throws Exception {
    return isUniqueUsername(username);
  }

  private static String isUniqueUsername(String username) throws IOException {
    Firebase.init();
    Firestore db = FirestoreClient.getFirestore();

    CollectionReference users = db.collection("users");

    Query query = users.whereEqualTo("username", username);

    try {
      ApiFuture<QuerySnapshot> querySnapshot = query.get();
      List<QueryDocumentSnapshot> queryDocuments = querySnapshot.get().getDocuments();

      if (queryDocuments.isEmpty()) {
        return "true";
      }
    } catch (Exception e) {
      System.out.println(e);
    }

    return "false";
  }
}
