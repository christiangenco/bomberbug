import info.gridworld.actor.*;
import info.gridworld.grid.*;
import info.gridworld.world.*;
import java.awt.Color;
//Sound effects
import java.io.BufferedInputStream;
import java.io.FileInputStream;
import javazoom.jl.player.Player;

public class Bonus extends Rock{
	String type;
	/*TYPES OF BONUSES:
	 *ExpandBombRadius: adds one to the current bug's bomb radius
	 *AddMoreBombs: adds one to the current bug's allowed number of concurrent bombs
	 */
	String types[] = {"ExpandBombRadius", "AddMoreBombs", "SuperBomb"};
	private Player player;
		
    public Bonus() {this("");}
    public Bonus(int i){
    	super();
    	if(i<types.length)
    		this.type = types[i];
    	setColor(null);
    }
    //ahhhh code duplication
    public Bonus(String type){
    	this.type = type;
    	setColor(null);
    }
    
    public String getImageSuffix(){
    	return type;
    }
    
    public String toString(){
    	return "Bonus:" + type;
    }
    public String[] getTypes(){
    	return types;
    }
    
    public void putSelfInGrid(Grid g, Location loc){
    	super.putSelfInGrid(g, loc);
    	play("bonus_revealed");
    }
    public void removeSelfFromGrid(){
    	super.removeSelfFromGrid();
    	play("bonus_gotten");
    }
    
    public String getType(){return type;}
    public void setType(String t){type = t;}
    
    public void play(String filename) {
    	filename = "sound\\" + filename + ".mp3";
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
}