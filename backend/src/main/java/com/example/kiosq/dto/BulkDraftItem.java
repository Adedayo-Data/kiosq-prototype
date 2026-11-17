package com.example.kiosq.dto;

public record BulkDraftItem(
    String imageUrl,
    String suggestedTitle,
    String whatsappCaption,
    String slug
) {}
