package com.gfl.api.controller;

import com.gfl.api.model.Collection;
import com.gfl.api.service.CollectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/collections")
@RequiredArgsConstructor
public class CollectionController {

    private final CollectionService collectionService;

    @GetMapping
    public ResponseEntity<List<Collection>> getAllCollections(
            @RequestParam(required = false, defaultValue = "false") boolean publicOnly) {
        if (publicOnly) {
            return ResponseEntity.ok(collectionService.getPublicCollections());
        }
        return ResponseEntity.ok(collectionService.getAllCollections());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Collection> getCollectionById(@PathVariable String id) {
        return collectionService.getCollectionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Collection> createCollection(@RequestBody Collection collection) {
        return ResponseEntity.ok(collectionService.saveCollection(collection));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Collection> updateCollection(@PathVariable String id, @RequestBody Collection collection) {
        if (!collectionService.getCollectionById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        collection.setId(id); // Ensure ID matches path
        return ResponseEntity.ok(collectionService.saveCollection(collection));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCollection(@PathVariable String id) {
        collectionService.deleteCollection(id);
        return ResponseEntity.noContent().build();
    }
}
