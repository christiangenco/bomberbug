import info.gridworld.actor.Rock;

public class Wall extends Rock{
    public Wall() {
    	//setColor(null);
    }
    
    public void removeSelfFromGrid(){
    	//don't do it!
    }
    
    public String toString(){
    	return "Wall";
    }
}