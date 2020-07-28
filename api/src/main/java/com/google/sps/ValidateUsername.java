package com.google.sps;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.Query;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.firebase.cloud.FirestoreClient;
import com.google.api.core.ApiFuture;

import java.util.List;

@RestController
public class ValidateUsername {
  @PostMapping("/validateUsername")
  Boolean checkUsername(@RequestBody String username) throws Exception {
    return isUniqueUsername(username);
  }

  private static Boolean isUniqueUsername(String username) throws Exception {
    Firebase.init();
    Firestore db = FirestoreClient.getFirestore();

    CollectionReference users = db.collection("users");

    Query query = users.whereEqualTo("username", username);

    ApiFuture<QuerySnapshot> querySnapshot = query.get();
    List<QueryDocumentSnapshot> queryDocuments = querySnapshot.get().getDocuments();

    if (queryDocuments.isEmpty()) {
      return true;
    }

    return false;
  }
}
