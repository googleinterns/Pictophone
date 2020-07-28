package com.google.sps;

enum EmailType {
  TURN, END;
}

public class Email {

 private final User player;
 private final String subject;
 private final String body;
 private static final String turnEmailSubject = "Your turn to draw!";
 private static final String endEmailSubject = "The game has ended!";
 private static final StringBuffer turnEmailBody = new StringBuffer("It's time to draw!\n\n Click here to play: http://phoebeliang-step.appspot.com/game/");
 private static final StringBuffer endEmailBody = new StringBuffer("Thanks for playing! Find all the images from the game attached below. Come play again sometime:\n\nhttp://phoebeliang-step.appspot.com/game/");

  public Email(User player, String subject, String body) {
    this.player = player;
    this.subject = subject;
    this.body = body;
  }

  public static Email playerTurnEmail(String gameID, User player) {
    String turnBody = turnEmailBody.append(gameID).toString();

    return new Email(player, turnEmailSubject, turnBody);
  }

  public static Email endGameEmail(String gameID, User player) {
    String endBody = endEmailBody.append(gameID).toString();

    return new Email(player, endEmailSubject, endBody);
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

  static Email populateEmail(String gameID, String playerEmail, String playerName, EmailType emailType)
    throws RuntimeException {

    switch(emailType) {
      case TURN:
        return playerTurnEmail(gameID, new User(playerEmail, playerName));
      case END:
        return endGameEmail(gameID, new User(playerEmail, playerName));
      default:
        System.out.println("Invalid email type");
        throw new RuntimeException();
    }
  }

}
