package com.google.sps;


import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String email;
    private String username;

    protected User() {}

    public User(String email, String username) {
        this.email = email;
        this.username = username;
    }git ad

    @Override
    public String toString() {
        return String.format(
                "Email: %s, Username: %s",
                email, username);
    }
}
