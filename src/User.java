public class User {
    private String name;
    private double monthlyBudget;
    private double currentBalance;
    private String riskProfile;

    public User(String name,double monthlyBudget,double currentBalance,String riskProfile)
    {
        this.name = name;
        this.monthlyBudget = monthlyBudget;
        this.currentBalance = currentBalance;
        this.riskProfile = riskProfile;
    }

    public String getName(){return name;}
    public double getMonthlyBudget(){return monthlyBudget;}
    public double currentBalance(){return currentBalance;}
    public String getRiskProfile(){return riskProfile;}

    public void setCurrentBalance(double currentBalance){
        this.currentBalance = currentBalance;
    }

    public void setMonthlyBudget(double monthlyBudget){
        this.monthlyBudget = monthlyBudget;
    }

    @Override
    public String toString(){
        return "Utilizator: " + name + "|Sold: " + currentBalance + "RON | Profile" + riskProfile;
    }
}
