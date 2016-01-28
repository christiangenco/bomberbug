import info.gridworld.actor.*;
import info.gridworld.grid.*;
import java.util.*;
import java.awt.Color;

//Sound effects
import java.io.BufferedInputStream;
import java.io.FileInputStream;
import javazoom.jl.player.Player;

public class BomberBug extends Bug{
	private int maxBombs;
	boolean placeBomb;
	private int bombRadius;
	private boolean superBomb;
	ArrayList<Bomb> bombs;
	private Player player;
	
	public BomberBug(){
		this(Color.RED);
	}
	
	public BomberBug(Color c){
		this(1, c);
	}
    public BomberBug(int maxBombs, Color c){
    	setColor(c);
    	bombs = new ArrayList<Bomb>();
    	this.maxBombs = maxBombs;
    	bombRadius = 2;
    	superBomb = false;
    }
    
    public void act(){}
    public void move(){}
    public void updateBombCount(){
    	//System.out.println("bombs before updating counter: " + bombs);
    	for(int i = 0; i<bombs.size();i++)
    		if(bombs.get(i).getGrid() == null){
    			bombs.remove(i);
    			i--;
    		}

    	//System.out.println("bombs after updating counter: " + bombs);
    }
    
	public boolean placeBomb(){
		updateBombCount();
		//System.out.println("bombs.size() == " + bombs.size() + "\nmaxBombs == " + maxBombs + "\n");
		if(bombs.size() < maxBombs){
			placeBomb = true;
			play("bomb_dropped");
			return true;
		}
		return false;
	}

    public void turn(){
        setDirection(getDirection() + Location.HALF_RIGHT);
    }

    public void move(int direction){
        Grid<Actor> gr = getGrid();if(gr == null)return;
        Location loc = getLocation();
        setDirection(direction);
        Location next = loc.getAdjacentLocation(getDirection());
        if(gr.isValid(next)){
        	Actor occupant = gr.get(next);
        	if(occupant == null || occupant instanceof Bonus || occupant instanceof Fire){
        		moveTo(next);
        		play("bug_step");
        		
        		if(placeBomb){
        			Bomb bomb = new Bomb(4, bombRadius);
        			
        			if(superBomb){
        				bomb.setIsSuperBomb(true);
        				superBomb = false;
        			}
        			
        			bomb.putSelfInGrid(gr, loc);
        			bombs.add(bomb);
        			placeBomb = false;
        			play("bomb_armed");
        		}
        		
        		if(occupant instanceof Bonus){
        			addBonus(occupant);
        		}
       	 	}else if(occupant instanceof Wall){
       	 		play("hit_wall");
       	 	}else if(occupant instanceof Brick){
       	 		play("hit_brick");
       	 	}else if(occupant instanceof KittyCat){
       	 		play("cat_love_you");
       	 	}
        }else play("hit_wall");
    }
    
    public void addBonus(Actor a){
    	Bonus bonus = (Bonus) a;
    	String type = bonus.getType();
    	if(type == null) return;
    	
    	if(type.equals("ExpandBombRadius")){
    		//play("extra_long");
    		bombRadius++;
    	}else if(type.equals("AddMoreBombs")){
    		//play("more_bombs");
    		maxBombs++;
    	}else if(type.equals("SuperBomb")){
    		superBomb = true;
    	}
    }
    
    public void removeSelfFromGrid(){
    	super.removeSelfFromGrid();
    	play("dead_bug");
    }

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

	public String toString(){
		String output = "";
		Color c = getColor();
		
		if(c.equals(Color.RED))
			output += "Red";
		else if(c.equals(Color.ORANGE))
			output += "Orange";
		else if(c.equals(Color.YELLOW))
			output += "Yellow";
		else if(c.equals(Color.GREEN))
			output += "Green";
		else if(c.equals(Color.BLUE))
			output += "Blue";
		else if(c.equals(Color.PINK))
			output += "Pink";

		return output + " Bug";
	}
}