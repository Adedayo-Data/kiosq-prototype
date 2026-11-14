package com.example.kiosq.repository;

import com.example.kiosq.model.CreditRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CreditRecordRepository extends JpaRepository<CreditRecord, Long> {
    List<CreditRecord> findByMerchantIdOrderByRecordedAtDesc(Long merchantId);
}
