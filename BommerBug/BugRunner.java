import info.gridworld.actor.*;
import info.gridworld.grid.*;
import java.util.*;
import java.io.*;
import java.awt.Color;

//Sound effects
import java.io.BufferedInputStream;
import java.io.FileInputStream;
import javazoom.jl.player.Player;

public class BugRunner{
	//private int rows = 44, cols = 70, players = 4, level = 4;
	private int rows = 15, cols = 15, players = 2, level = 4;
	
	private Player player;
    public static void main(String[] args){
    	BugRunner run = new BugRunner(); run.run();
    }
    
    public void run(){
    	boolean stop = false;
    	Scanner kb = new Scanner(System.in);
    	while(!stop){
    		ArrayList<BomberBug> bugs = new ArrayList<BomberBug>();
    		bugs.add(new BomberBug(Color.GREEN));
    		bugs.add(new BomberBug(Color.BLUE));
    		bugs.add(new BomberBug(Color.RED));
    		bugs.add(new BomberBug(Color.PINK));
    	
    		/*
    		Scanner kb = new Scanner(System.in);
    		System.out.print("How many rows? :: ");
    		rows = new Integer(kb.nextLine());
    		System.out.print("How many columns? :: ");
    		cols = new Integer(kb.nextLine());
    		System.out.print("How many players? :: ");
    		players = new Integer(kb.nextLine());
    		System.out.print("What level? :: ");
    		level = new Integer(kb.nextLine());
    		*/
    	
    		for(int i=bugs.size()-1; i>players-1; i--)
    			bugs.remove(i);
    	
    		BugWorld world = new BugWorld(rows, cols, bugs, level);

			play("bomber_bug");
		
        	world.show();
        	
        	System.out.print("New Game? (y/n) :: ");
        	String input = kb.nextLine().trim();
        	stop = input.length() >0 && (input.toLowerCase().charAt(0) + "").equals("n");
    	}
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