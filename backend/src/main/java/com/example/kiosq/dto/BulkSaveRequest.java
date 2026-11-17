package com.example.kiosq.dto;

import java.util.List;

public record BulkSaveRequest(
    List<BulkSaveProductItem> items
) {}
