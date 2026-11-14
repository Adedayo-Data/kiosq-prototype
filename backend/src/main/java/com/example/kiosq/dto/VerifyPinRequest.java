package com.example.kiosq.dto;

public record VerifyPinRequest(
    String orderReference,
    String pin
) {}
