package com.google.sps;

import com.google.api.services.gmail.Gmail;

public class GmailService {
  public static Gmail service;

  public static void init() {
    try {
      service = ServiceCreation.createService();
    } catch(Exception e) {
      e.printStackTrace();
    }

  }
}
