package com.google.sps;

public class Email {

 private final User player;
 private final String subject;
 private final String body;

  public Email(User player, String subject, String body) {
    this.player = player;
    this.subject = subject;
    this.body = body;
  }

  public static Email startGameEmail(String gameID, User player) {
    String tempSubject = "You have an invitation!";
    String tempBody = "Welcome to Pictophone!\n\n" + player.getName() + " has invited you to a game! Join here: http://phoebeliang-step.appspot.com/game/" + gameID;

    return new Email(player, tempSubject, tempBody);
  }

  public static Email playerTurnEmail(String gameID, User player) {
    String tempSubject = "Your turn to draw!";
    String tempBody = "It's time to draw!\n\n Click here to play: http://phoebeliang-step.appspot.com/game/" + gameID;

    return new Email(player, tempSubject, tempBody);
  }

  public static Email endGameEmail(User player) {
    String tempSubject = "The game has ended!";
    String tempBody = "Thanks for playing! Find all the images from the game attached below. Come play again sometime:\n\nhttp://phoebeliang-step.appspot.com";

    return new Email(player, tempSubject, tempBody);
  }

  public String getBody(){
    return body;
  }

  public String getSubject(){
    return subject;
  }

  public String getEmail(){

    return player.getEmail();
  }
}
