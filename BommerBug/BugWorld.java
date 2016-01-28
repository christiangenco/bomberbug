import info.gridworld.actor.*;
import info.gridworld.grid.*;
import info.gridworld.world.*;
import java.util.*;
//Sound effects
import java.io.BufferedInputStream;
import java.io.FileInputStream;
import javazoom.jl.player.Player;

public class BugWorld extends ActorWorld{
	ArrayList<BomberBug> bugs;
	private Player player;
	
	private boolean gameOver;
	
	private int rows;
	private int cols;
	private ArrayList<BomberBug> bs;
	private int level;
	
	//arrays of the player controls
	//follows pattern {UP, DOWN, LEFT, RIGHT, BOMB};
	private String[] controlsOne = {"W","S","A","D","Q"};
	private String[] controlsTwo = {"UP","DOWN","LEFT","RIGHT","SLASH"};
	private String[] controlsThree = {"U","J","H","K","Y"};
	private String[] controlsFour = {"NUMPAD8","NUMPAD5","NUMPAD4","NUMPAD6","NUMPAD7"};
	
	public BugWorld(int rows, int cols, ArrayList<BomberBug> bs, int level){
		this.bugs = bs;
		gameOver = false;
		int players = bugs.size();
		
		if(level<1) level = 1;
		
		if(rows%2 == 0)rows++;
		if(cols%2 == 0) cols++;
		if(rows<5)rows=5;
		if(cols<5)cols=5;
		
		this.rows = rows;this.cols = cols; this.bs = bs; this.level = level;
		
    	int numberOfBricks = (rows * cols) / 5 * (int) Math.sqrt(level);
    	
    	//Make Grid and world
        BoundedGrid<Actor> grid = new BoundedGrid<Actor>(rows, cols);
		
		//figure out which spaces not to put bricks in
		ArrayList<Location> tabooLocations = new ArrayList<Location>();
		switch(players){
			case 4: 
				//lower left corner
				tabooLocations.add(new Location(rows-1, 0));
				tabooLocations.add(new Location(rows-2, 0));
				tabooLocations.add(new Location(rows-1, 1));
			case 3: 
				//upper right corner
				tabooLocations.add(new Location(0, cols-1));
				tabooLocations.add(new Location(0, cols-2));
				tabooLocations.add(new Location(1, cols-1));
			case 2: 
				//lower right corner
				tabooLocations.add(new Location(rows-1, cols-1));
				tabooLocations.add(new Location(rows-2, cols-1));
				tabooLocations.add(new Location(rows-1, cols-2));
				
				//upper left corner
				tabooLocations.add(new Location(0,0));
				tabooLocations.add(new Location(0,1));
				tabooLocations.add(new Location(1,0));
				break;
			default: return;
		}
		
		//put in unbreakable walls
        for(int r = 0; r<grid.getNumRows();r++){
        	for(int c = 0; c < grid.getNumCols(); c++){
        		if(r%2 == 1 && c%2 == 1){
        			grid.put(new Location(r, c), new Wall());
        		}
        	}
        }
		
		//put in breakable bricks
		ArrayList<Brick> bricks = new ArrayList<Brick>();
        while(bricks.size() < numberOfBricks){
        	int r = (int) (rows * Math.random());
        	int c = (int) (cols * Math.random());
        	
        	Location loc = new Location(r, c);
        	
        	if((r%2 == 0 || c%2 == 0) && !tabooLocations.contains(loc) && grid.get(loc) == null){
        		Brick b = new Brick();
        		b.putSelfInGrid(grid, new Location(r,c));
        		bricks.add(b);
        	}
        }
        
        //add bonuses
        int types = Math.min((new Bonus()).getTypes().length, level-1);
        int numberOfBonuses = (int) Math.sqrt(rows * cols);
        int bonusCount = 0;
        while(bonusCount < numberOfBonuses && level > 1){//no bonuses on level 1
        	int brickIndex = (int) (Math.random() * bricks.size());
        	Brick brick = bricks.get(brickIndex);
        	if(brick.getBonus() == null){
        		int bonusIndex = (int)(Math.random() * types);
        		Bonus bonus = new Bonus(bonusIndex);
        		brick.setBonus(bonus);
        		//System.out.println(bonus);
        		bonusCount++;
        	}
        }
        
        /*Brick b1 = new Brick();
        b1.putSelfInGrid(grid, new Location(0,2));
        b1.setBonus(new Bonus(2));
        */
        
        /*
        Brick b = new Brick();
        b.setBonus(new Bonus(1));
        grid.remove(new Location(2,0));
        b.putSelfInGrid(grid, new Location(0, 2));*/
        
        
        //put in bugs
        ArrayList<Location> potentialBugLocations = new ArrayList<Location>();
        potentialBugLocations.add(new Location(0,0));//upper left corner
        potentialBugLocations.add(new Location(rows-1, cols-1));//lower right corner
        potentialBugLocations.add(new Location(0, cols-1));//upper right corner
        potentialBugLocations.add(new Location(rows-1, 0));//lower left corner
        for(int i=0;i<bugs.size();i++)
        	bugs.get(i).putSelfInGrid(grid, potentialBugLocations.get(i));
        	
		setGrid(grid);
			     
        //put in random bugs
        int randomBugs = (level-2) * (int)(Math.sqrt(Math.min(getGrid().getNumRows(), getGrid().getNumCols())));
		for(int i=0; i<randomBugs;i++){
			Location randomBugLocation = getRandomEmptyLocation();
			if(!tabooLocations.contains(randomBugLocation)){
				Actor bug;
				if(Math.random() < .85)
					bug = new RandomBug();
				else
					bug = new RandomCritter();		
				bug.putSelfInGrid(grid, randomBugLocation);				
			}

		}
			
		

		play("background_music");
		
		String message = "Adjust the speed all the way to \"fast\" and press \"run\" to play!\n";
		message += "-----------------------------CONTROLS (scroll down)-----------------------------\n";
		//this should really be in a for loop...
		message += "Player 1: " + controlsOne[0] + ", " + controlsOne[1] + ", " + controlsOne[2] + ", and " + controlsOne[3] + " to move; " + controlsOne[4] + " to drop bomb.\n";
		message += "Player 2: " + controlsTwo[0] + ", " + controlsTwo[1] + ", " + controlsTwo[2] + ", and " + controlsTwo[3] + " to move, " + controlsTwo[4] + " to drop bomb.\n";
		if(players >= 3)
			message += "Player 3: " + controlsThree[0] + ", " + controlsThree[1] + ", " + controlsThree[2] + ", and " + controlsThree[3] + " to move, " + controlsThree[4] + " to drop bomb.\n";
		if(players == 4)
			message += "Player 4: " + controlsFour[0] + ", " + controlsFour[1] + ", " + controlsFour[2] + ", and " + controlsFour[3] + " to move, " + controlsFour[4] + " to drop bomb.\n";
		setMessage(message);
	}
    
    public void step(){
    	super.step();
    	if(!gameOver){
    		String message = "";
    		int deadCounter = 0;
    		for(int i=0;i<bugs.size();i++){
    			if(bugs.get(i).getGrid() == null){
    				message += "Oh no! The " + bugs.get(i).toString().toLowerCase() + " died! :-(\n";
    				deadCounter++;
    			}
    		}
    		
    		if(deadCounter >= bugs.size()-1){
    			if (player != null) player.close();
    			play("game_over");
    			gameOver = true;
    			
    			BomberBug winner = new BomberBug();;
    			for(BomberBug b:bugs)
    				if(b.getGrid() != null)
    					winner = b;
    			
    			message+=winner + " wins!";
    		}
    		setMessage(message);
    	}
    }

    public boolean keyPressed(String description, Location loc){
    	//System.out.println(description + " was just pressed.");
    	int size = bugs.size();
    	if(size >=2){//if there are two or more players, define the first two players' controls
    		BomberBug bug1 = bugs.get(0);
    		BomberBug bug2 = bugs.get(1);
    	
    		if(description.equals(controlsOne[0])){
    			bug1.move(0);
    		}else if(description.equals(controlsOne[1])){
    			bug1.move(180);
    		}else if(description.equals(controlsOne[2])){
    			bug1.move(270);
    		}else if(description.equals(controlsOne[3])){
    			bug1.move(90);
    		}else if(description.equals(controlsOne[4])){
    			bug1.placeBomb();
    		}else if(description.equals(controlsTwo[0])){
    			bug2.move(0);
    		}else if(description.equals(controlsTwo[1])){
    			bug2.move(180);
    		}else if(description.equals(controlsTwo[2])){
    			bug2.move(270);
    		}else if(description.equals(controlsTwo[3])){
    			bug2.move(90);
    		}else if(description.equals(controlsTwo[4])){
    			bug2.placeBomb();
    		}
    		
    		//if there are three or more players, define player 3 controls
    		if(size >= 3){
    			BomberBug bug3 = bugs.get(2);
    		
    			if(description.equals(controlsThree[0])){
    				bug3.move(0);
    			}else if(description.equals(controlsThree[1])){
    				bug3.move(180);
    			}else if(description.equals(controlsThree[2])){
    				bug3.move(270);
    			}else if(description.equals(controlsThree[3])){
    				bug3.move(90);
    			}else if(description.equals(controlsThree[4])){
    				bug3.placeBomb();
    			}
    			
    			//if there are four players, define player 4 controls
    			if(size == 4){
    				BomberBug bug4 = bugs.get(3);
    				//System.out.println(bug4);
    		
    				if(description.equals(controlsFour[0])){
    					bug4.move(0);
    				}else if(description.equals(controlsFour[1])){
    					bug4.move(180);
    				}else if(description.equals(controlsFour[2])){
    					bug4.move(270);
    				}else if(description.equals(controlsFour[3])){
    					bug4.move(90);
    				}else if(description.equals(controlsFour[4])){
    					bug4.placeBomb();
    				}
    			}
    		}
    	}
    	
    	if(description.equals("ESCAPE")){
    		System.out.println("RESETTING");
    	}
    	
    	return true;
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
}