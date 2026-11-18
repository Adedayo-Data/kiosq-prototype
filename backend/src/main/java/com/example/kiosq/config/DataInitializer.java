package com.example.kiosq.config;

import com.example.kiosq.model.EscrowOrder;
import com.example.kiosq.model.Merchant;
import com.example.kiosq.model.Product;
import com.example.kiosq.repository.EscrowOrderRepository;
import com.example.kiosq.repository.MerchantRepository;
import com.example.kiosq.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(
            MerchantRepository merchantRepository,
            ProductRepository productRepository,
            EscrowOrderRepository escrowOrderRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            // Seed default merchant with email: tola@kiosq.africa / password123
            Merchant merchant = merchantRepository.findByEmail("tola@kiosq.africa").orElseGet(() -> {
                Merchant m = new Merchant(
                        "Chioma Adeleke",
                        "tola@kiosq.africa",
                        "08012345678",
                        passwordEncoder.encode("password123"),
                        "Mama Tola Textiles",
                        "Balogun Market, Lagos Island"
                );
                m.setBankName("Access Bank");
                m.setAccountNumber("0123456789");
                m.setAccountName("Mama Tola Textiles");
                m.setVerified(true);
                return merchantRepository.save(m);
            });

            // Seed demo product if missing
            Product product = productRepository.findBySlug("ankara-wax").orElseGet(() -> {
                Product p = new Product();
                p.setSlug("ankara-wax");
                p.setTitle("Authentic Ankara Wax Print (6 Yards)");
                p.setDescription("Teal & Gold Celestial Swirl • 100% Combed Cotton • Grade A Super Wax");
                p.setAskingPrice(new BigDecimal("28000"));
                p.setFloorPrice(new BigDecimal("23000"));
                p.setCategory("Fashion & Fabrics");
                p.setImageUrl("https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=800&q=80");
                p.setWhatsappCaption("Original Hollandais Ankara 6 yards! Pay into Kiosq Escrow with your 4-digit PIN handoff.");
                p.setMerchant(merchant);
                return productRepository.save(p);
            });

            // Seed default demo escrow order if missing
            if (escrowOrderRepository.findByOrderReference("ORD-4821").isEmpty()) {
                EscrowOrder o = new EscrowOrder();
                o.setOrderReference("ORD-4821");
                o.setProduct(product);
                o.setMerchant(merchant);
                o.setAmount(new BigDecimal("28000"));
                o.setBuyerName("Amina Bello");
                o.setBuyerPhone("0803 456 7890");
                o.setDeliveryAddress("14 Admiralty Way, Lekki Phase 1, Lagos");
                o.setDeliveryPin("7429");
                o.setStatus(EscrowOrder.EscrowStatus.FUNDS_HELD_IN_ESCROW);
                o.setPaidAt(LocalDateTime.now().minusHours(2));
                escrowOrderRepository.save(o);
            }
        };
    }
}
