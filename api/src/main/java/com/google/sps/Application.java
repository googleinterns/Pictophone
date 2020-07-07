package com.google.sps;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@SpringBootApplication
@RestController

public class Application {
  @GetMapping("/notify")
  public static void main(String[] args) {
    SpringApplication.run(Application.class, args);

    List<Email> emails = prepareEmail();

    try {
      Notifications.sendNotification(emails);
    } catch(Exception e) {
      System.out.println("Working Directory = " + System.getProperty("user.dir"));
      System.out.println("Exception Caught Here: " + e);
    }
  }

  public List<Email> prepareEmail(HttpServletRequest request, HttpServletResponse response) throws IOException {
    GoogleCredentials credentials = GoogleCredentials.getApplicationDefault();
    String projectId = "phoebeliang-step";
    FirebaseOptions options = new FirebaseOptions.Builder()
        .setCredentials(credentials)
        .setProjectId(projectId)
        .build();
    FirebaseApp.initializeApp(options);

    Firestore db = FirestoreClient.getFirestore();

    Iterable<DocumentReference> users = db.collection("users").listDocuments();
    String link = request.getParameter("gameLink");
    List<Email> emails = startGameEmail(users, link);

    return emails;
  }

  public List<Email> startGameEmail(Iterable<DocumentReference> users, String gameLink) {
    List<Email> emails = new ArrayList<>();
    for(DocumentReference user: users) {
      try {
        DocumentSnapshot docSnap = user.get().get();

        //Retrieves player information
        String playerEmail = docSnap.getString("email");
        String playerName = docSnap.getString("username");

        //Adding player to Email object
        emails.add(new Email(new User(playerEmail, playerName)));

        //Adds Start game message to the email object
        emails.get(emails.size()-1).startGame(gameLink);

      } catch(Exception e) {
        System.out.println(e);
      }
    }

    return emails;
  }

  @GetMapping("/")
  public String hello() {
    return "Hello world!";
  }

}
