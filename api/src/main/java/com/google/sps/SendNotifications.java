package com.google.sps;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;
import com.google.api.services.gmail.model.Message;
import com.google.api.services.gmail.Gmail;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Properties;
import java.util.concurrent.ExecutionException;
import java.util.ArrayList;
import java.util.List;

import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.internet.*;

import org.apache.commons.codec.binary.Base64;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SendNotifications {
  static boolean firebaseInitialized = false;

  public List<Email> gatherRecipients(HttpServletRequest request, HttpServletResponse response)
    throws IOException {

    Firestore db = FirestoreClient.getFirestore();
    String gameID = request.getParameter("gameID");
    EmailType emailType = EmailType.valueOf(request.getParameter("emailType").toUpperCase());
    List<Email> emails = new ArrayList<>();

    DocumentReference game = db.collection("games").document(gameID);
    CollectionReference players = db.collection("users");
    try {
      DocumentSnapshot gameDocSnap = game.get().get();

      List<String> playerNames = ((List<String>) gameDocSnap.get("players"));

      for (String player : playerNames) {
        DocumentSnapshot usersDocSnap = players.document(player).get().get();

        // Retrieves player information
        String playerEmail = usersDocSnap.getString("email");
        String hostName = players.document(playerNames.get(0)).get().get().getString("username");

        // Adding player to Email object
        emails.add(Email.populateEmail(gameID, playerEmail, hostName, emailType));

        // Checks if there are any players
        if (emails.isEmpty()) {
          throw new IllegalArgumentException();
        }
      }
    } catch (Exception e) {
      throw new IOException(e);
    }

    return emails;
  }

  public Email getNextRecipient(HttpServletRequest request, HttpServletResponse response)
    throws IOException {

    Firestore db = FirestoreClient.getFirestore();
    String gameID = request.getParameter("gameID");
    DocumentReference game = db.collection("games").document(gameID);
    CollectionReference players = db.collection("users");
    EmailType emailType = EmailType.valueOf(request.getParameter("emailType").toUpperCase());

    try {
      DocumentSnapshot gameDocSnap = game.get().get();
      int currentPlayerIndex = (int) ((long) gameDocSnap.get("currentPlayerIndex"));
      String playerName = ((List<String>) gameDocSnap.get("players")).get(currentPlayerIndex + 1);

      DocumentSnapshot usersDocSnap = players.document(playerName).get().get();

      // Retrieves player information
      String playerEmail = usersDocSnap.getString("email");

      return Email.populateEmail(gameID, playerEmail, playerName, emailType);
    } catch (Exception e) {
      throw new IOException(e);
    }
  }

  @PostMapping("/api/notify")
  public void sendEmail(HttpServletRequest request, HttpServletResponse response)
      throws IOException, InterruptedException, ExecutionException {

    EmailType emailType = EmailType.valueOf(request.getParameter("emailType").toUpperCase());
    final String FROM = "pictophone.noreply@gmail.com";

    switch(emailType) {
      case END:
        List<Email> emails = gatherRecipients(request, response);

        try {
          for (Email email : emails) {
            MimeMessage encoded = createEmail(email.getEmail(), FROM, email.getSubject(), email.getBody());
            Message testMessage = sendMessage(GmailService.service, FROM, encoded);

            System.out.println("Email: " + testMessage.toPrettyString());
          }
        } catch (Exception e) {
          System.out.println("Exception in End Email: " + e);
          e.printStackTrace();
        }
        break;
      case TURN:
        Email player = getNextRecipient(request, response);

        try {
          MimeMessage encoded = createEmail(player.getEmail(), FROM, player.getSubject(), player.getBody());
          Message testMessage = sendMessage(GmailService.service, FROM, encoded);

          System.out.println("Email: " + testMessage.toPrettyString());
        } catch (Exception e) {
          System.out.println("Exception in Turn Email: " + e);
          e.printStackTrace();
        }
        break;
      default:
        System.out.println("Invalid email type given");
        throw new RuntimeException();
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
    return message;
  }
}
