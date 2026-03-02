package com.gfl.api.service;

import com.gfl.api.model.Collection;
import com.gfl.api.repository.CollectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CollectionService {

    private final CollectionRepository collectionRepository;

    public List<Collection> getAllCollections() {
        return collectionRepository.findAll();
    }

    public List<Collection> getPublicCollections() {
        return collectionRepository.findByIsPublicTrue();
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
