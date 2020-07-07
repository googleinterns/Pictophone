package com.google.sps;

public class Email {

 User player;
 String subject;
 String body;

  public Email(User p, String s, String b) {
    p = player;
    s = subject;
    b = body;
  }

  private void startGame(String gameLink) {
    subject = "You have an invitation!";
    body = "Welcome to Pictophone!\n\n" + player.getName() + " has invited you to a game! Join here: " + gameLink;
  }
}
