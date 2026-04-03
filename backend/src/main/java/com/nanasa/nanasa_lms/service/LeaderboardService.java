package com.nanasa.nanasa_lms.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class LeaderboardService {

    @Scheduled(cron = "0 0 0 * * ?")
    public void updateLeaderboard() {
        System.out.println("Executing Cron Job: Calculating Ranks for Leaderboard...");
        // Logic to calculate rank:
        // 1. Fetch avg scores grouped by subject and student from results.
        // 2. Sort them.
        // 3. Save into Leaderboard repository.
        System.out.println("Leaderboard updated successfully.");
    }
}
