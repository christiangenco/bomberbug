import info.gridworld.actor.Rock;
import java.awt.Color;
import info.gridworld.actor.*;
import info.gridworld.grid.*;
import info.gridworld.world.*;
//Sound effects
import java.io.BufferedInputStream;
import java.io.FileInputStream;
import javazoom.jl.player.Player;
public class Brick extends Rock{
	private Player player;
	private Bonus bonus;
	
    public Brick() {
    	bonus = null; 
    }
    
    public void setBonus(Bonus b){
    	bonus = b;
    }
    public Bonus getBonus(){
    	return bonus;
    }
    
    public void removeSelfFromGrid(){
    	Grid grid = getGrid();
    	Location loc = getLocation();
    	super.removeSelfFromGrid();
    	if(bonus != null){
    		bonus.putSelfInGrid(grid, loc);
    	}
    }
     
    public void play(String filename) {
    	filename = "sound\\" + filename;
        try {
            FileInputStream fis     = new FileInputStream(filename);
            BufferedInputStream bis = new BufferedInputStream(fis);
            player = new Player(bis);
        }
        catch (Exception e) {
            System.out.println("Problem playing file " + filename);
            System.out.println(e);
        }

        // run in new thread to play in background
        new Thread() {
            public void run() {
                try { player.play(); }
                catch (Exception e) { System.out.println(e); }
            }
        }.start();
    }
    
    public String toString(){
    	return "Brick";
    }
}