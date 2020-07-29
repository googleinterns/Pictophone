package com.google.sps;

import java.io.IOException;
import java.security.GeneralSecurityException;

import org.json.simple.parser.ParseException;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController

public class Application {
  public static void main(String[] args) throws IOException, ParseException, GeneralSecurityException {
    Firebase.init();
    GmailService.init();

    SpringApplication.run(Application.class, args);
  }

  @GetMapping("/")
  public String pulseCheck() {
    return "Server is alive!";
  }
}
