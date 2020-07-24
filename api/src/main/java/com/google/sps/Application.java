package com.google.sps;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController

public class Application {
  public static void main(String[] args) {
    try {
      Firebase.init();
    } catch (Exception e) {
      throw new RuntimeException(e);
    }

    SpringApplication.run(Application.class, args);
  }

  @GetMapping("/")
	public String pulseCheck() {
		return "Server is alive!";
	}
}
