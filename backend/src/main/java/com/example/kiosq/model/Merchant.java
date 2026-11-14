package com.example.kiosq.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "merchants")
public class Merchant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String phone;

    private String email;

    @Column(nullable = false)
    private String password; // BCrypt hashed password

    @Column(nullable = false)
    private String businessName;

    private String marketLocation; // e.g. Balogun Market, Lagos Island

    private String bankName;
    private String accountNumber;
    private String accountName;

    private boolean verified = true;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Merchant() {}

    public Merchant(String fullName, String phone, String email, String password, String businessName, String marketLocation) {
        this.fullName = fullName;
        this.phone = phone;
        this.email = email;
        this.password = password;
        this.businessName = businessName;
        this.marketLocation = marketLocation;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }

    public String getMarketLocation() { return marketLocation; }
    public void setMarketLocation(String marketLocation) { this.marketLocation = marketLocation; }

    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }

    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

    public String getAccountName() { return accountName; }
    public void setAccountName(String accountName) { this.accountName = accountName; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
