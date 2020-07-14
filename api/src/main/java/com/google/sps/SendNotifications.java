package com.google.sps;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;
import com.google.api.services.gmail.model.Message;
import com.google.api.core.ApiFuture;
import com.google.api.services.gmail.Gmail;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.util.Properties;
import java.util.concurrent.ExecutionException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import javax.activation.DataHandler;
import javax.activation.DataSource;
import javax.activation.FileDataSource;
import javax.activation.URLDataSource;
import javax.mail.MessagingException;
import javax.mail.Multipart;
import javax.mail.Session;
import javax.mail.internet.*;

import org.apache.commons.codec.binary.Base64;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SendNotifications {
  boolean firebaseInitialized = false;

  public List<Email> gatherRecipients(HttpServletRequest request, HttpServletResponse response, Firestore db)
      throws IOException {

    String gameID = request.getParameter("gameID");
    String emailType = request.getParameter("emailType");
    List<Email> emails = new ArrayList<>();

    DocumentReference game = db.collection("games").document(gameID);
    CollectionReference players = db.collection("users");
    try {
      DocumentSnapshot gameDocSnap = game.get().get();
      List<String> playerNames = (List<String>) gameDocSnap.get("players");

      for (String player : playerNames) {
        DocumentSnapshot usersDocSnap = players.document(player).get().get();

        // Retrieves player information
        String playerEmail = usersDocSnap.getString("email");
        String playerName = usersDocSnap.getString("username");

        // Adding player to Email object
        if (emailType.equalsIgnoreCase("start")) {
          emails.add(Email.startGameEmail(gameID, new User(playerEmail, playerName)));
        } else if (emailType.equalsIgnoreCase("end") || emailType.equalsIgnoreCase("turn")) {
          emails.add(Email.endGameEmail(new User(playerEmail, playerName)));
        }

        // Checks if there are any players
        if (emails.isEmpty()) {
          throw new IllegalArgumentException();
        }
      }
    } catch (Exception e) {
      System.out.println("Exception in gatherRecipients" + e);
    }

    return emails;
  }

  public Email getNextPlayer(HttpServletRequest request, HttpServletResponse response, Firestore db)
      throws IOException {
    String gameID = request.getParameter("gameID");
    DocumentReference game = db.collection("games").document(gameID);
    CollectionReference players = db.collection("users");
    Email notification = null;

    try {
      DocumentSnapshot gameDocSnap = game.get().get();
      int currentPlayerIndex = (int) ((long) gameDocSnap.get("currentPlayerIndex"));
      String playerName = ((List<String>) gameDocSnap.get("players")).get(currentPlayerIndex + 1);

      DocumentSnapshot usersDocSnap = players.document(playerName).get().get();

      // Retrieves player information
      String playerEmail = usersDocSnap.getString("email");

      notification = Email.playerTurnEmail(gameID, new User(playerEmail, playerName));
    } catch (Exception e) {
      System.out.println("Exception with QuerySnapshot" + e);
    }

    if (notification == null) {
      throw new IllegalArgumentException();
    }

    return notification;
  }

  @GetMapping("/notify")
  public void sendEmail(HttpServletRequest request, HttpServletResponse response)
      throws IOException, InterruptedException, ExecutionException {

    if (!firebaseInitialized) {
      GoogleCredentials credentials = GoogleCredentials.getApplicationDefault();
      String projectId = "phoebeliang-step";
      FirebaseOptions options = new FirebaseOptions.Builder().setCredentials(credentials).setProjectId(projectId)
          .build();
      FirebaseApp.initializeApp(options);
      firebaseInitialized = true;
    }

    Firestore db = FirestoreClient.getFirestore();

    String emailType = request.getParameter("emailType");
    String gameID = request.getParameter("gameID");
    final String FROM = "pictophone.noreply@gmail.com";
    ImageStorage.downloadObject("kitten.png");


    DocumentSnapshot docSnap = db.collection("games").document(gameID).get().get();
    int amtOfPlayers = ((List<String>) docSnap.get("players")).size();
    int currentPlayer = (int) ((long) docSnap.get("currentPlayerIndex"));

    if (emailType.equalsIgnoreCase("start") || emailType.equalsIgnoreCase("end") || (currentPlayer+1) >= amtOfPlayers) {
      List<Email> emails = gatherRecipients(request, response, db);

      try {
        Gmail service = ServiceCreation.createService();


        if(emailType.equalsIgnoreCase("end") || emailType.equalsIgnoreCase("turn")) {
          File file = new File("images/kitten.png");
          for (Email email : emails) {
            MimeMessage encoded = createEmailWithAttachment(email.getEmail(), FROM, email.getSubject(), email.getBody(), file);
            Message testMessage = sendMessage(service, FROM, encoded);
          }
        } else {
          for (Email email : emails) {
            MimeMessage encoded = createEmail(email.getEmail(), FROM, email.getSubject(), email.getBody());
            Message testMessage = sendMessage(service, FROM, encoded);
          }
        }
      } catch (Exception e) {
        System.out.println("Method Exception: " + e);
        System.err.println(e);
      }
    } else if (emailType.equalsIgnoreCase("turn")) {
      Email player = getNextPlayer(request, response, db);
      System.out.println(player.getEmail());

      try {
        Gmail service = ServiceCreation.createService();

        MimeMessage encoded = createEmail(player.getEmail(), FROM, player.getSubject(), player.getBody());
        Message testMessage = sendMessage(service, FROM, encoded);
      } catch (Exception e) {
        System.out.println("Exception with service: " + e);
      }
    }

  }

  // ***********************HELPER METHODS**********************************

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

  public static MimeMessage createEmailWithAttachment(String to, String from, String subject, String bodyText,
      File file)
            throws MessagingException, IOException {
        Properties props = new Properties();
        Session session = Session.getDefaultInstance(props, null);

        MimeMessage email = new MimeMessage(session);

        email.setFrom(new InternetAddress(from));
        email.addRecipient(javax.mail.Message.RecipientType.TO,
                new InternetAddress(to));
        email.setSubject(subject);

        MimeBodyPart mimeBodyPart = new MimeBodyPart();
        mimeBodyPart.setContent(bodyText, "text/plain");

        Multipart multipart = new MimeMultipart();
        multipart.addBodyPart(mimeBodyPart);

        mimeBodyPart = new MimeBodyPart();
        DataSource source = new FileDataSource(file);

        mimeBodyPart.setDataHandler(new DataHandler(source));
        mimeBodyPart.setFileName("Endgame Photo");

        multipart.addBodyPart(mimeBodyPart);
        email.setContent(multipart);

        return email;
    }
}
