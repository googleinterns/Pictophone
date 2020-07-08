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
import java.util.List;

import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.internet.*;

import org.apache.commons.codec.binary.Base64;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

public class SendNotifications {

  public List<Email> gatherRecipients(HttpServletRequest request, HttpServletResponse response) throws IOException {
    GoogleCredentials credentials = GoogleCredentials.getApplicationDefault();
    String projectId = "phoebeliang-step";
    FirebaseOptions options = new FirebaseOptions.Builder().setCredentials(credentials).setProjectId(projectId).build();
    FirebaseApp.initializeApp(options);

    Firestore db = FirestoreClient.getFirestore();

    String gameID = "oo0j05CCUJNqQxSFSNEI";
    List<Email> emails = new ArrayList<>();

    DocumentReference game = db.collection("games").document(gameID);
    CollectionReference players = db.collection("users");
    try {
      DocumentSnapshot gameDocSnap = game.get().get();
      String[] playerNames = gameDocSnap.get("players", String[].class);

      for(String player: playerNames) {

        DocumentSnapshot usersDocSnap = players.document(player).get().get();

        //Retrieves player information
        String playerEmail = usersDocSnap.getString("email");
        String playerName = usersDocSnap.getString("username");

        //Adding player to Email object
        emails.add(new Email(new User(playerEmail, playerName)));

        //Adds Start game message to the email object
        emails.get(emails.size()-1).startGame(gameID);
      }
    } catch (Exception e) {
      System.out.println(e);
    }

    return emails;
  }

  @PostMapping("/notifyStart")
  public void startGameEmail(HttpServletRequest request, HttpServletResponse response) throws IOException {

    List<Email> emails = gatherRecipients(request, response);
    final String FROM = "pictophone.noreply@gmail.com";

    System.out.println("Working...");
    try{
      Gmail service = ServiceCreation.createService();

      for(Email email: emails) {
        MimeMessage encoded = createEmail(email.player.getEmail(), FROM, email.getSubject(), email.getBody());
        Message testMessage = sendMessage(service, FROM, encoded);
      }
    } catch(Exception e) {
      System.out.println("Main Method Exception: " + e);
    }
  }

  //***********************HELPER METHODS**********************************

  private static MimeMessage createEmail(String to, String from, String subject, String bodyText)
      throws MessagingException {
    Properties props = new Properties();
    Session session = Session.getDefaultInstance(props, null);

    MimeMessage email = new MimeMessage(session);

    email.setFrom(new InternetAddress(from));
    email.addRecipient(javax.mail.Message.RecipientType.TO, new InternetAddress(to));
    email.setSubject(subject);
    email.setText(bodyText);
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
