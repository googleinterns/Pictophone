package com.google.sps;

import java.io.IOException;
import java.security.GeneralSecurityException;

import com.google.api.services.gmail.Gmail;

public class GmailService {
  public static Gmail service;

  public static void init() throws IOException, GeneralSecurityException {
    service = ServiceCreation.createService();
  }
}
