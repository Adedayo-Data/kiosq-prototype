package com.example.kiosq.dto;

import java.util.List;

public record BulkDraftRequest(
    List<String> imageUrls,
    String businessName
) {}
