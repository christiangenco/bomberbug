import info.gridworld.actor.*;
import info.gridworld.grid.*;
import java.util.*;
import java.awt.Color;

//Sound effects
import java.io.BufferedInputStream;
import java.io.FileInputStream;
import javazoom.jl.player.Player;

public class RandomCritter extends Critter{
	private int scale;
	private int step;
    public RandomCritter(){
    	scale = 70 + (int)(Math.random() * 70);
    	step = + (int)(Math.random() * 50);
    	setColor(Color.RED);
    }
    
    public void act(){
    	//System.out.println(step + " " + scale);
    	if(step >= scale){
    		super.act();
    		step = 0;	
    	}
    	else
    		step++;
    }
    
}