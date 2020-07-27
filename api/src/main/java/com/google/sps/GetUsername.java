package com.google.sps;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;
import com.google.api.core.ApiFuture;

@RestController
public class GetUsername {
  @PostMapping("/getUsername")
  String getUsername(@RequestBody String uid) throws Exception {
    Firebase.init();
    Firestore db = FirestoreClient.getFirestore();

    DocumentReference userRef = db.collection("users").document(uid);
    ApiFuture<DocumentSnapshot> future = userRef.get();
    DocumentSnapshot userDoc = future.get();

    return userDoc.getString("username");
  }
}
