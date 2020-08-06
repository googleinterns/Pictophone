package com.google.sps;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Serializable;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.GeneralSecurityException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.google.api.client.extensions.java6.auth.oauth2.AuthorizationCodeInstalledApp;
import com.google.api.client.extensions.jetty.auth.oauth2.LocalServerReceiver;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.client.util.store.DataStore;
import com.google.api.client.util.store.AbstractDataStore;
import com.google.api.client.util.store.DataStoreFactory;
import com.google.api.client.util.store.AbstractDataStoreFactory;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.GmailScopes;
import com.google.cloud.firestore.Firestore;

import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.FieldValue;
import com.google.firebase.cloud.FirestoreClient;

import org.springframework.util.ResourceUtils;
import org.apache.commons.lang3.SerializationUtils;


public class ServiceCreation {
  private static final String APPLICATION_NAME = "Notifications";
  private static final JsonFactory JSON_FACTORY = JacksonFactory.getDefaultInstance();

  static Firestore db = FirestoreClient.getFirestore();
  static DocumentReference docRef = db.collection("credentials").document("credential");

  private static final DataStoreFactory dataStoreFactory = new AbstractDataStoreFactory() {
    @Override
    protected <V extends Serializable> DataStore<V> createDataStore(final String id) {
      return new FireDataStore<>(this, id);
    }
  };

  /**
   * Global instance of the scopes required by this quickstart. If modifying these
   * scopes, delete your previously saved tokens/ folder.
   */
  private static final List<String> SCOPES = Collections.singletonList(GmailScopes.MAIL_GOOGLE_COM);
  private static final String CREDENTIALS_FILE_PATH = "./gmail_credentials.json";

  /**
   * Creates an authorized Credential object.
   *
   * @param HTTP_TRANSPORT The network HTTP Transport.
   * @return An authorized Credential object.
   * @throws IOException If the credentials.json file cannot be found.
   */
  private static HttpRequestInitializer getCredentials(NetHttpTransport HTTP_TRANSPORT) throws IOException {
    // Load client secrets.
    Path currentRelativePath = Paths.get("");
    String s = currentRelativePath.toAbsolutePath().toString();
    System.out.println("Current relative path is: " + s);

    File file = ResourceUtils.getFile(CREDENTIALS_FILE_PATH);
    if (file == null) {
      throw new FileNotFoundException("Resource not found: " + CREDENTIALS_FILE_PATH);
    }
    InputStream in = new FileInputStream(file);
    GoogleClientSecrets clientSecrets = GoogleClientSecrets.load(JSON_FACTORY, new InputStreamReader(in));

    // Build flow and trigger user authorization request.
    GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(HTTP_TRANSPORT, JSON_FACTORY,
        clientSecrets, SCOPES).setDataStoreFactory(dataStoreFactory)
            .setAccessType("offline").build();
    LocalServerReceiver receiver = new LocalServerReceiver.Builder().setPort(8888).build();

    return new AuthorizationCodeInstalledApp(flow, receiver).authorize("user");
  }

  public static Gmail createService() throws IOException, GeneralSecurityException {
    // Build a new authorized API client service.
    final NetHttpTransport HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();
    Gmail service = new Gmail.Builder(HTTP_TRANSPORT, JSON_FACTORY, getCredentials(HTTP_TRANSPORT))
            .setApplicationName(APPLICATION_NAME)
            .build();

            System.out.println("Service Created..: " + service);

    return service;
  }

  // Custom datastore implementation with FireStore
  private static class FireDataStore<V extends Serializable> extends AbstractDataStore<V> {

    FireDataStore(DataStoreFactory dataStoreFactory1, String id1) {
      super(dataStoreFactory1, id1);
    }

    @Override
    public DataStore<V> set(String key, V value) throws IOException {
      final String encoded = Base64.getEncoder().encodeToString(SerializationUtils.serialize(value));
      Map<String, Object> data = new HashMap<>();
      data.put(key, encoded);
      docRef.set(data);

      return this;
    }

    @Override
    public V get(String key) throws IOException {
      try {
        DocumentSnapshot document = docRef.get().get();
        if (!document.exists()) return null;
        final String encoded = document.getString(key);
        if (encoded == null) {
          return null;
        }
        return SerializationUtils.deserialize(Base64.getDecoder().decode(encoded));
      } catch (Exception e) {
        throw new IOException(e);
      }
    }

    @Override
    public DataStore<V> clear() throws IOException {
      docRef.delete();
      return this;
    }

    @Override
    public DataStore<V> delete(String key) throws IOException {
      Map<String, Object> updates = new HashMap<>();
      updates.put(key, FieldValue.delete());
      docRef.update(updates);
      return this;
    }

    @Override
    public Collection<V> values() throws IOException {
      Collection<V> result = new ArrayList<>();
      try {
        DocumentSnapshot document = docRef.get().get();

        if (!document.exists()) return result;
        Map<String, Object> map = document.getData();
        if (map == null) return result;
        for (Map.Entry<String, Object> entry : map.entrySet()) {
          String encoded = entry.getValue().toString();
          V deserialized = SerializationUtils.deserialize(Base64.getDecoder().decode(encoded));
          result.add(deserialized);
        }
      } catch (Exception e) {
        throw new IOException(e);
      }
      return result;
    }

    @Override
    public Set<String> keySet() throws IOException {
      Set<String> result = new HashSet<>();
      try {
        DocumentSnapshot document = docRef.get().get();

        if (!document.exists()) return result;
        Map<String, Object> map = document.getData();
        if (map == null) return result;
        for (Map.Entry<String, Object> entry : map.entrySet()) {
          result.add(entry.getKey().toString());
        }
      } catch (Exception e) {
        throw new IOException(e);
      }

      return result;
    }

  }
}
