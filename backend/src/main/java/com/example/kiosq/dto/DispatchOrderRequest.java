package com.example.kiosq.dto;

public record DispatchOrderRequest(
    String courierName,
    String courierPhone,
    String packedItemPhoto
) {}
