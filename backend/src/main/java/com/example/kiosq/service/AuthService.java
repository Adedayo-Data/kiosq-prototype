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
        if (merchantRepository.existsByPhone(req.phone())) {
            throw new IllegalArgumentException("A merchant with phone " + req.phone() + " already exists!");
        }

        Merchant merchant = new Merchant(
                req.fullName(),
                req.phone(),
                req.email(),
                passwordEncoder.encode(req.password()),
                req.businessName(),
                req.marketLocation() != null ? req.marketLocation() : "Lagos, Nigeria"
        );
        Merchant saved = merchantRepository.save(merchant);

        String token = jwtService.generateToken(saved.getPhone(), saved.getId(), saved.getBusinessName());
        return new AuthResponse(token, saved.getId(), saved.getBusinessName(), saved.getPhone(), "Merchant registered successfully!");
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        Merchant merchant = merchantRepository.findByPhone(req.phone())
                .orElseThrow(() -> new IllegalArgumentException("Merchant not found with phone: " + req.phone()));

        if (!passwordEncoder.matches(req.password(), merchant.getPassword())) {
            throw new IllegalArgumentException("Invalid phone or password!");
        }

        String token = jwtService.generateToken(merchant.getPhone(), merchant.getId(), merchant.getBusinessName());
        return new AuthResponse(token, merchant.getId(), merchant.getBusinessName(), merchant.getPhone(), "Login successful!");
    }
}
