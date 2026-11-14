package com.example.kiosq.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtService {

    // 256-bit secure key for signing Kiosq tokens
    private static final String SECRET = "kiosq_super_secret_jwt_key_that_is_at_least_32_bytes_long_for_security!";
    private static final long EXPIRATION_TIME = 86400000L * 7; // 7 days

    private final SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));

    public String generateToken(String phone, Long merchantId, String businessName) {
        return Jwts.builder()
                .subject(phone)
                .claim("merchantId", merchantId)
                .claim("businessName", businessName)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key)
                .compact();
    }

    public String extractPhone(String token) {
        return getClaims(token).getSubject();
    }

    public Long extractMerchantId(String token) {
        return getClaims(token).get("merchantId", Long.class);
    }

    public boolean isTokenValid(String token) {
        try {
            return !getClaims(token).getExpiration().before(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
