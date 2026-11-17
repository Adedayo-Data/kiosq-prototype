package com.example.kiosq.service;

import com.example.kiosq.config.JwtService;
import com.example.kiosq.dto.AuthResponse;
import com.example.kiosq.dto.LoginRequest;
import com.example.kiosq.dto.RegisterRequest;
import com.example.kiosq.model.Merchant;
import com.example.kiosq.repository.MerchantRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final MerchantRepository merchantRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            MerchantRepository merchantRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.merchantRepository = merchantRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (req.email() == null || req.email().trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required for registration!");
        }

        String normalizedEmail = req.email().trim().toLowerCase();

        if (merchantRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("A merchant with email " + normalizedEmail + " already exists!");
        }

        Merchant merchant = new Merchant(
                req.fullName(),
                normalizedEmail,
                req.phone(),
                passwordEncoder.encode(req.password()),
                req.businessName(),
                req.marketLocation() != null ? req.marketLocation() : "Lagos, Nigeria"
        );
        Merchant saved = merchantRepository.save(merchant);

        String token = jwtService.generateToken(saved.getEmail(), saved.getId(), saved.getBusinessName());
        return new AuthResponse(token, saved.getId(), saved.getBusinessName(), saved.getEmail(), saved.getPhone(), "Merchant registered successfully!");
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        if (req.email() == null || req.email().trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required!");
        }

        String normalizedEmail = req.email().trim().toLowerCase();

        Merchant merchant = merchantRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("Merchant not found with email: " + normalizedEmail));

        if (!passwordEncoder.matches(req.password(), merchant.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password!");
        }

        String token = jwtService.generateToken(merchant.getEmail(), merchant.getId(), merchant.getBusinessName());
        return new AuthResponse(token, merchant.getId(), merchant.getBusinessName(), merchant.getEmail(), merchant.getPhone(), "Login successful!");
    }
}
