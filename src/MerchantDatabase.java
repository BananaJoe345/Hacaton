import java.util.*;

class Merchant {
    private String name;
    private List<String> products;
    private String category;

    public Merchant(String name, String category, String... products) {
        this.name = name;
        this.category = category;
        this.products = Arrays.asList(products);
    }

    public String getName() { return name; }
    public String getCategory() { return category; }
    public List<String> getProducts() { return products; }
}

public class MerchantDatabase {
    private static final Map<String, Merchant> db = new HashMap<>();

    static {
        // Supermarket
        db.put("lidl", new Merchant("Lidl", "Mancare", "Lapte Pilos", "Paine Integrala", "Iaurt Grecesc"));
        db.put("kaufland", new Merchant("Kaufland", "Mancare", "Ulei de floarea soarelui", "Carne pui", "Detergent"));
        db.put("mega image", new Merchant("Mega Image", "Mancare", "Apa plata", "Fructe proaspete", "Gustari"));
        
        // Transport
        db.put("omv", new Merchant("OMV", "Transport", "Benzina MaxxMotion 95", "Motorina", "Sandwich Viva", "Cafea"));
        db.put("petrom", new Merchant("Petrom", "Transport", "Benzina Standard", "Motorina", "Lichid Parbriz"));
        db.put("bolt", new Merchant("Bolt", "Transport", "Cursa Oras", "Livrare Colet"));
        
        // Shopping
        db.put("emag", new Merchant("eMAG", "Shopping", "Gadget-uri", "Electrocasnice", "Carti"));
        db.put("zara", new Merchant("Zara", "Shopping", "Tricou Bumbac", "Blugi Slim Fit", "Sacou Casual"));
        db.put("hm", new Merchant("H&M", "Shopping", "Haine Copii", "Pulover", "Accesorii"));

        // Delivery
        db.put("glovo", new Merchant("Glovo", "Mancare", "Meniu Burger King", "Comanda Farmacie", "Cumparaturi"));
        db.put("5 to go", new Merchant("5 To Go", "Mancare", "Espresso", "Cappuccino", "Muffin"));
    }

    public static Merchant findMerchant(String input) {
        String search = input.toLowerCase();
        for (String key : db.keySet()) {
            if (search.contains(key)) {
                return db.get(key);
            }
        }
        return null; // Daca nu gasim magazinul
    }
}