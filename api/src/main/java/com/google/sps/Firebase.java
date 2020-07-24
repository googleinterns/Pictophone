package com.google.sps;

import com.google.firebase.FirebaseApp;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseOptions;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

import java.io.FileReader;

/** Maintain an instance of Firebase */
public class Firebase {

  public static void init() {
      JSONParser parser = new JSONParser();

      try {
        Object obj = parser.parse(new FileReader("./config.json"));
        JSONObject jsonObject = (JSONObject) obj;
        String projectId = (String) jsonObject.get("project_id");

        FirebaseOptions options = new FirebaseOptions.Builder()
          .setCredentials(GoogleCredentials.getApplicationDefault())
          .setProjectId(projectId)
          .build();
        if(FirebaseApp.getApps().isEmpty()) {
          FirebaseApp.initializeApp(options);
        }
      } catch (Exception e) {
        e.printStackTrace();
      }
  }
}
