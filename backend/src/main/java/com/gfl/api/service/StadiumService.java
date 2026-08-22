package com.gfl.api.service;

import com.gfl.api.model.Stadium;
import com.gfl.api.repository.StadiumRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StadiumService {

    private final StadiumRepository stadiumRepository;

    public StadiumService(StadiumRepository stadiumRepository) {
        this.stadiumRepository = stadiumRepository;
    }

    public List<Stadium> getAllStadiums() {
        return stadiumRepository.findAll();
    }

    public Optional<Stadium> getStadiumById(Long id) {
        return stadiumRepository.findById(id);
    }

    public Stadium saveStadium(Stadium stadium) {
        return stadiumRepository.save(stadium);
    }

    public Stadium updateStadium(Long id, Stadium stadiumDetails) {
        return stadiumRepository.findById(id).map(stadium -> {
            stadium.setName(stadiumDetails.getName());
            stadium.setCapacity(stadiumDetails.getCapacity());
            stadium.setLocation(stadiumDetails.getLocation());
            stadium.setImage(stadiumDetails.getImage());
            stadium.setLatitude(stadiumDetails.getLatitude());
            stadium.setLongitude(stadiumDetails.getLongitude());
            stadium.setRegion(stadiumDetails.getRegion());
            return stadiumRepository.save(stadium);
        }).orElseThrow(() -> new RuntimeException("Stadium not found with id " + id));
    }

    public void deleteStadium(Long id) {
        stadiumRepository.deleteById(id);
    }
}
