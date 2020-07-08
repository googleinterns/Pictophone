package com.google.sps;

public class Email {

 User player;
 private String subject;
 private String body;

  public Email(User p) {
    p = player;
    subject = "Subject";
    body = "body";
  }

  public void startGame(String gameLink) {
    if(gameLink.equals(null)) {
      gameLink = "Link not found";
    }
    subject = "You have an invitation!";
    body = "Welcome to Pictophone!\n\n" + player.getName() + " has invited you to a game! Join here: http://phoebeliang-step.appspot.com/game/" + gameID;
  }

  public String getBody(){
    return body;
  }

  public String getSubject(){
    return subject;
  }
}
