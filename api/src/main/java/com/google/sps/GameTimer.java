package com.google.sps;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class GameTimer {

  @PostMapping("/api/start")
  public void timerInit(HttpServletRequest request, HttpServletResponse response) {
    
  }
}
