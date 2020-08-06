package com.google.sps;

import com.google.firebase.FirebaseApp;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseOptions;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import java.io.FileReader;
import java.io.IOException;

/** Maintain an instance of Firebase */
public class Firebase {

  public static void init() throws IOException, ParseException {
    JSONParser parser = new JSONParser();

    Object obj = parser.parse(new FileReader("./service_account.json"));
    JSONObject jsonObject = (JSONObject) obj;
    String projectId = (String) jsonObject.get("project_id");

    FirebaseOptions options = new FirebaseOptions.Builder()
      .setCredentials(GoogleCredentials.getApplicationDefault())
      .setProjectId(projectId)
      .build();
    if (FirebaseApp.getApps().isEmpty()) {
      FirebaseApp.initializeApp(options);
    }
  }
}
