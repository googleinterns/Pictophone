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
import com.google.cloud.firestore.Firestore;

import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

import java.io.IOException;

@SpringBootApplication
@RestController
@WebServlet("/notify")
public class Application {

	public static void main(String[] args) {
    SpringApplication.run(Application.class, args);

    try {
      Notifications.sendNotification();
    } catch(Exception e) {
      System.out.println("Working Directory = " + System.getProperty("user.dir"));
      System.out.println("Exception Caught Here: " + e);
    }
  }

  // public void sendNotifications(HttpServletRequest request, HttpServletResponse response) throws IOException {

  //   GoogleCredentials credentials = GoogleCredentials.getApplicationDefault();
  //   String projectId = "phoebeliang-step";
  //   FirebaseOptions options = new FirebaseOptions.Builder()
  //       .setCredentials(credentials)
  //       .setProjectId(projectId)
  //       .build();
  //   FirebaseApp.initializeApp(options);

  //   Firestore db = Firestore.getFirestore();

  //   String link = request.getParameter("gameLink");

  // }

	@GetMapping("/")
	public String hello() {
		return "Hello world!";
	}

}
