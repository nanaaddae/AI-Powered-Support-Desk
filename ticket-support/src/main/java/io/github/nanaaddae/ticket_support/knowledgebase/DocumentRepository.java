package io.github.nanaaddae.ticket_support.knowledgebase;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
 
import java.util.List;
import java.util.UUID;
 
public interface DocumentRepository extends JpaRepository<Document, UUID> {

@Query(value = """
    SELECT * FROM knowledge_base_documents
    WHERE embedding <=> CAST(:embedding AS vector) < :threshold
    ORDER BY embedding <=> CAST(:embedding AS vector) ASC
    LIMIT :limit
    """, nativeQuery = true)
List<Document> findSimilar(
    @Param("embedding") String embedding, 
    @Param("threshold") double threshold, 
    @Param("limit") int limit
);

}