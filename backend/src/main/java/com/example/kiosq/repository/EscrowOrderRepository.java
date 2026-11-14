package com.example.kiosq.repository;

import com.example.kiosq.model.EscrowOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EscrowOrderRepository extends JpaRepository<EscrowOrder, Long> {
    Optional<EscrowOrder> findByOrderReference(String orderReference);
    List<EscrowOrder> findByMerchantIdOrderByCreatedAtDesc(Long merchantId);
    List<EscrowOrder> findByMerchantIdAndStatus(Long merchantId, EscrowOrder.EscrowStatus status);
}
