package com.google.sps;

import com.google.firebase.FirebaseApp;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseOptions;
import com.google.sps.SendNotifications;

/** Maintain an instance of Firebase */
public class Firebase {

  public static void init() {
    if (!SendNotifications.firebaseInitialized) {
      try {
      FirebaseOptions options = new FirebaseOptions.Builder()
          .setCredentials(GoogleCredentials.getApplicationDefault())
          .setProjectId("phoebeliang-step")
          .build();
      FirebaseApp.initializeApp(options);
      SendNotifications.firebaseInitialized = true;
      } catch (Exception e) {
        e.printStackTrace();
      }
    }
  }
}
