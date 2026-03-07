import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.awt.event.KeyAdapter;
import java.awt.event.KeyEvent;

public class AppGUI extends JFrame {
    private DefaultTableModel tableModel;
    private JTextField txtMagazin, txtSuma, txtCategorie;
    private JLabel lblSold, lblSugestie;
    private double soldTotal = 2000.0;

    public AppGUI() {
        setTitle("SmartMoney Management - Hackathon Edition");
        setSize(700, 500);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout(10, 10));

        JPanel panelInput = new JPanel(new GridLayout(3, 2, 5, 5));
        panelInput.setBorder(BorderFactory.createTitledBorder("Adaugă Tranzacție"));

        txtMagazin = new JTextField();
        txtSuma = new JTextField();
        txtCategorie = new JTextField();
        lblSugestie = new JLabel("Sugestie: -");
        lblSugestie.setForeground(Color.BLUE);

        txtMagazin.addKeyListener(new KeyAdapter() {
            @Override
            public void keyReleased(KeyEvent e) {
                Merchant m = MerchantDatabase.findMerchant(txtMagazin.getText());
                if (m != null) {
                    lblSugestie.setText("Sugestie: " + m.getCategory() + " (" + m.getProducts().get(0) + "...)");
                    txtCategorie.setText(m.getCategory());
                }
            }
        });

        panelInput.add(new JLabel(" Magazin:"));
        panelInput.add(txtMagazin);
        panelInput.add(new JLabel(" Sumă (RON):"));
        panelInput.add(txtSuma);
        panelInput.add(new JLabel(" Categorie:"));
        panelInput.add(txtCategorie);

        String[] columns = {"Magazin", "Categorie", "Sumă", "Tip"};
        tableModel = new DefaultTableModel(columns, 0);
        JTable table = new JTable(tableModel);
        JScrollPane scrollPane = new JScrollPane(table);

        JPanel panelBottom = new JPanel(new BorderLayout());
        JButton btnAdd = new JButton("Adaugă Cheltuială");
        lblSold = new JLabel("Sold Curent: 2000.0 RON  ", SwingConstants.RIGHT);
        lblSold.setFont(new Font("Arial", Font.BOLD, 14));

        btnAdd.addActionListener(e -> adaugaTranzactie());

        panelBottom.add(lblSugestie, BorderLayout.NORTH);
        panelBottom.add(btnAdd, BorderLayout.CENTER);
        panelBottom.add(lblSold, BorderLayout.SOUTH);

        add(panelInput, BorderLayout.NORTH);
        add(scrollPane, BorderLayout.CENTER);
        add(panelBottom, BorderLayout.SOUTH);
    }

    private void adaugaTranzactie() {
        try {
            String magazin = txtMagazin.getText();
            String cat = txtCategorie.getText();
            double suma = Double.parseDouble(txtSuma.getText());

            tableModel.addRow(new Object[]{magazin, cat, suma, "Cheltuială"});
            soldTotal -= suma;
            lblSold.setText("Sold Curent: " + soldTotal + " RON  ");

            txtMagazin.setText("");
            txtSuma.setText("");
            txtCategorie.setText("");
            lblSugestie.setText("Sugestie: -");

        } catch (Exception e) {
            JOptionPane.showMessageDialog(this, "Te rugăm să introduci o sumă validă!");
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new AppGUI().setVisible(true));
    }
}