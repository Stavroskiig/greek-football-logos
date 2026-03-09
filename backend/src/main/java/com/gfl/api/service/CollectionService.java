package com.gfl.api.service;

import com.gfl.api.model.Collection;
import com.gfl.api.repository.CollectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CollectionService {

    private final CollectionRepository collectionRepository;

    public Page<Collection> getAllCollections(Pageable pageable) {
        return collectionRepository.findAll(pageable);
    }

    public Page<Collection> getPublicCollections(Pageable pageable) {
        return collectionRepository.findByIsPublicTrue(pageable);
    }

    public Page<Collection> searchCollections(String searchTerm, boolean publicOnly, Pageable pageable) {
        if (publicOnly) {
            return collectionRepository
                    .findByIsPublicTrueAndNameContainingIgnoreCaseOrIsPublicTrueAndDescriptionContainingIgnoreCase(
                            searchTerm, searchTerm, pageable);
        } else {
            return collectionRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(searchTerm,
                    searchTerm, pageable);
        }
    }

    public Optional<Collection> getCollectionById(String id) {
        return collectionRepository.findById(id);
    }

    public Collection saveCollection(Collection collection) {
        return collectionRepository.save(collection);
    }

    public void deleteCollection(String id) {
        collectionRepository.deleteById(id);
    }
}
