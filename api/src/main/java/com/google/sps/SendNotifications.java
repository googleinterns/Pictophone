package com.google.sps;

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
import com.google.api.services.gmail.model.Message;
import com.google.api.services.gmail.Gmail;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Properties;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.internet.*;

import org.apache.commons.codec.binary.Base64;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SendNotifications {

  public List<Email> gatherRecipients() throws IOException {
    GoogleCredentials credentials = GoogleCredentials.getApplicationDefault();

    System.out.println("Google Credentials created...");

    String projectId = "phoebeliang-step";
    FirebaseOptions options = new FirebaseOptions.Builder().setCredentials(credentials).setProjectId(projectId).build();
    FirebaseApp.initializeApp(options);

    System.out.println("App Initialized...");

    Firestore db = FirestoreClient.getFirestore();

    String gameID = "dT6U1wQKR1rGJcEncyMS";
    List<Email> emails = new ArrayList<>();

    DocumentReference game = db.collection("games").document(gameID);
    CollectionReference players = db.collection("users");
    try {
      DocumentSnapshot gameDocSnap = game.get().get();
      System.out.println("Is this the error?...");
      List<String> playerNames = (List<String>) gameDocSnap.get("players");
      System.out.println(playerNames);

      for(String player: playerNames) {

        DocumentSnapshot usersDocSnap = players.document(player).get().get();

        //Retrieves player information
        String playerEmail = usersDocSnap.getString("email");
        String playerName = usersDocSnap.getString("username");

        System.out.println(playerEmail);

        //Adding player to Email object
        emails.add(new Email(new User(playerEmail, playerName)));

        //Adds Start game message to the email object
        emails.get(emails.size()-1).playerTurn(gameID);
      }
    } catch (Exception e) {
      System.out.println(e);
    }

    return emails;
  }

  @GetMapping("/notifyTurn")
  public void playerTurnEmail() throws IOException {

    System.out.println("Working...");

    List<Email> emails = gatherRecipients();
    final String FROM = "pictophone.noreply@gmail.com";

    System.out.println("recipients gathered...: " + emails);
    try{
      Gmail service = ServiceCreation.createService();

      System.out.println(service);
      for(Email email: emails) {
        System.out.println("Sending email..: " + email);
        MimeMessage encoded = createEmail(email.player.getEmail(), FROM, email.getSubject(), email.getBody());
        Message testMessage = sendMessage(service, FROM, encoded);
      }
    } catch(Exception e) {
      System.out.println("Method Exception: " + e);
      System.err.println(e);
    }
  }

  //***********************HELPER METHODS**********************************

  private static MimeMessage createEmail(String to, String from, String subject, String bodyText)
      throws MessagingException {
        System.out.println("create");
    Properties props = new Properties();
    Session session = Session.getDefaultInstance(props, null);

    MimeMessage email = new MimeMessage(session);

    System.out.println("session");

    email.setFrom(new InternetAddress(from));
    email.addRecipient(javax.mail.Message.RecipientType.TO, new InternetAddress(to));
    email.setSubject(subject);
    email.setText(bodyText);

    System.out.println("Email Created: " + email.toString());
    return email;
  }

  private static Message createMessageWithEmail(MimeMessage emailContent) throws MessagingException, IOException {
    ByteArrayOutputStream buffer = new ByteArrayOutputStream();
    emailContent.writeTo(buffer);
    byte[] bytes = buffer.toByteArray();
    String encodedEmail = Base64.encodeBase64URLSafeString(bytes);
    Message message = new Message();
    message.setRaw(encodedEmail);
    return message;
  }

  private static Message sendMessage(Gmail service, String userId, MimeMessage emailContent)
    throws MessagingException, IOException {
  Message message = createMessageWithEmail(emailContent);
  message = service.users().messages().send(userId, message).execute();

  System.out.println("Message id: " + message.getId());
  System.out.println(message.toPrettyString());
      return message;
  }
}